import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { GoogleAuthProvider, linkWithPopup, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { connectFirebase } from "../config/firebase";
import { INITIAL_SERVICES, INITIAL_SUPPLIES, SAMPLE_NOVEMBER_SALES } from "../data/initialData";

const AppContext = createContext(null);
const ALLOWED_EMAIL = "printingideas060@gmail.com";

function readLocal(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function mergeSales(...salesLists) {
  const merged = new Map();
  for (const [listIndex, salesList] of salesLists.entries()) {
    for (const [index, sale] of (salesList || []).entries()) {
      if (sale.description === "Sample ledger entry") continue;
      merged.set(sale.id || `list-${listIndex}-${index}-${JSON.stringify(sale)}`, sale);
    }
  }
  return [...merged.values()];
}

export function AppProvider({ children }) {
  const [sales, setSales] = useState(() => readLocal("print_hub_sales", SAMPLE_NOVEMBER_SALES));
  const [supplies, setSupplies] = useState(() => readLocal("print_hub_supplies", INITIAL_SUPPLIES));
  const [services, setServices] = useState(() => readLocal("print_hub_services", INITIAL_SERVICES));
  const [syncStatus, setSyncStatus] = useState(() => window.navigator.onLine ? "connecting" : "offline");
  const [networkStatus, setNetworkStatus] = useState(() => window.navigator.onLine ? "online" : "offline");
  const [storageError, setStorageError] = useState("");
  const [cloudError, setCloudError] = useState("");
  const [firebase, setFirebase] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [cloud, setCloud] = useState(null);
  const valuesRef = useRef({ sales, supplies, services });
  const cloudInitializedRef = useRef(false);

  useEffect(() => {
    valuesRef.current = { sales, supplies, services };
  }, [sales, supplies, services]);

  useEffect(() => {
    const handleOffline = () => {
      setNetworkStatus("offline");
      setSyncStatus("offline");
    };
    const handleOnline = () => setNetworkStatus("online");
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribeAuth = () => {};

    try {
      const connection = connectFirebase();
      setFirebase(connection);
      unsubscribeAuth = onAuthStateChanged(
        connection.auth,
        (authenticatedUser) => {
          if (!active) return;
          if (
            authenticatedUser
            && (
              authenticatedUser.email?.toLowerCase() !== ALLOWED_EMAIL
              || !authenticatedUser.emailVerified
            )
          ) {
            setUser(null);
            setAuthReady(true);
            setCloud(null);
            cloudInitializedRef.current = false;
            setSyncStatus("offline");
            setCloudError(`Only the verified Google account ${ALLOWED_EMAIL} can access this app.`);
            signOut(connection.auth).catch((error) => {
              console.error("Could not sign out an unauthorized Firebase account.", error);
              if (active) setCloudError("An unauthorized account is signed in. Please sign out and try again.");
            });
            return;
          }
          setUser(authenticatedUser);
          setAuthReady(true);
          setCloud(null);
          cloudInitializedRef.current = false;
          setSyncStatus(authenticatedUser ? "connecting" : "offline");
          if (authenticatedUser) setCloudError("");
        },
        (error) => {
          console.error("Firebase authentication state failed.", error);
          if (active) {
            setCloudError("Could not check the Google sign-in state.");
            setAuthReady(true);
          }
        },
      );
    } catch (error) {
      console.error("Firebase setup failed.", error);
      setCloudError("Firebase is not configured correctly.");
      setAuthReady(true);
    }

    return () => {
      active = false;
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!firebase || !user) {
      setCloud(null);
      cloudInitializedRef.current = false;
      return undefined;
    }

    let active = true;
    let unsubscribeLedger = () => {};
    let unsubscribeSales = () => {};
    let initializingLedger = false;
    const ledgerRef = doc(firebase.db, "printingIdeas", "shared");
    const legacyLedgerRef = doc(firebase.db, "printingIdeas", user.uid);
    const salesRef = collection(ledgerRef, "sales");

    unsubscribeLedger = onSnapshot(
      ledgerRef,
      { includeMetadataChanges: true },
      async (remoteSnapshot) => {
        if (!active) return;

        if (remoteSnapshot.metadata.fromCache) {
          setSyncStatus(window.navigator.onLine ? "connecting" : "offline");
          return;
        }

        if (!initializingLedger) {
          initializingLedger = true;
          const localValues = valuesRef.current;
          try {
            const initialLedger = await runTransaction(firebase.db, async (transaction) => {
              const latestSnapshot = await transaction.get(ledgerRef);
              const legacySnapshot = await transaction.get(legacyLedgerRef);
              const remote = latestSnapshot.exists() ? latestSnapshot.data() : {};
              const legacy = legacySnapshot.exists() ? legacySnapshot.data() : {};
              const allMigratedSales = mergeSales(localValues.sales, legacy.sales, remote.sales);
              const services = Array.isArray(remote.services)
                ? remote.services
                : Array.isArray(legacy.services) ? legacy.services : localValues.services;
              const sharedSupplies = Array.isArray(remote.supplies)
                ? remote.supplies
                : Array.isArray(legacy.supplies) ? legacy.supplies : localValues.supplies;
              transaction.set(ledgerRef, {
                sales: deleteField(),
                supplies: sharedSupplies,
                services,
              }, { merge: true });
              return { migratedSales: allMigratedSales, supplies: sharedSupplies, services };
            });
            for (let offset = 0; offset < initialLedger.migratedSales.length; offset += 450) {
              const batch = writeBatch(firebase.db);
              initialLedger.migratedSales.slice(offset, offset + 450).forEach((sale, index) => {
                const saleId = sale.id || `migrated-${offset + index}`;
                batch.set(doc(salesRef, saleId), { ...sale, id: saleId });
              });
              await batch.commit();
            }
            if (active) {
              setSupplies(initialLedger.supplies);
              setServices(initialLedger.services);
            }
          } catch (error) {
            console.error("Could not initialize or merge the shared sales ledger.", error);
            if (active) {
              setCloudError(error.code === "permission-denied"
                ? `This Google account is not allowed to access the shared ledger. Deploy the updated firestore.rules.`
                : "Could not read or save the shared ledger. Check Firebase setup and Firestore rules.");
              setSyncStatus("offline");
            }
            return;
          }

          if (!active) return;
          setCloudError("");
          cloudInitializedRef.current = true;
          setCloud({ db: firebase.db, ledgerRef, salesRef });
          setSyncStatus(window.navigator.onLine ? "online" : "offline");
          unsubscribeSales = onSnapshot(
            salesRef,
            (snapshot) => {
              if (!active || snapshot.metadata.fromCache) return;
              const remoteSales = snapshot.docs.map((saleSnapshot) => ({
                ...saleSnapshot.data(),
                id: saleSnapshot.id,
              }));
              setSales(remoteSales);
              setSyncStatus(window.navigator.onLine ? "online" : "offline");
            },
            (error) => {
              console.error("Firebase shared sales listener failed.", error);
              if (active) {
                setCloudError(error.code === "permission-denied"
                  ? `This Google account is not allowed to access the shared ledger. Deploy the updated firestore.rules.`
                  : "Could not load shared sales. Check Firestore setup and rules.");
                setSyncStatus("offline");
              }
            },
          );
          return;
        }

        if (!remoteSnapshot.exists()) return;
        const remote = remoteSnapshot.data();
        const current = valuesRef.current;
        if (Array.isArray(remote.supplies) && JSON.stringify(remote.supplies) !== JSON.stringify(current.supplies)) setSupplies(remote.supplies);
        if (Array.isArray(remote.services) && JSON.stringify(remote.services) !== JSON.stringify(current.services)) setServices(remote.services);
        setSyncStatus(window.navigator.onLine ? "online" : "offline");
      },
      (error) => {
        console.error("Firebase shared-ledger listener failed.", error);
        if (active) {
          setCloudError(error.code === "permission-denied"
            ? `This Google account is not allowed to access the shared ledger. Deploy the updated firestore.rules.`
            : "Could not connect to the shared ledger. Check Firebase Authentication and Firestore.");
          setSyncStatus("offline");
        }
      },
    );
    return () => {
      active = false;
      unsubscribeLedger();
      unsubscribeSales();
    };
  }, [firebase, user]);

  useEffect(() => {
    try {
      window.localStorage.setItem("print_hub_sales", JSON.stringify(sales));
      window.localStorage.setItem("print_hub_supplies", JSON.stringify(supplies));
      window.localStorage.setItem("print_hub_services", JSON.stringify(services));
      setStorageError("");
    } catch (error) {
      console.error("Could not save ledger data to local storage.", error);
      setStorageError("Local storage is unavailable. Changes may not persist on this device.");
    }
  }, [sales, supplies, services]);

  useEffect(() => {
    if (!cloud || !cloudInitializedRef.current) return;
    setDoc(cloud.ledgerRef, { supplies, services }, { merge: true })
      .then(() => setSyncStatus(window.navigator.onLine ? "online" : "offline"))
      .catch((error) => {
        console.error("Could not sync shared prices to Firebase.", error);
        setCloudError("Could not save shared prices to Firebase.");
        setSyncStatus("offline");
      });
  }, [cloud, supplies, services]);

  const addSale = useCallback(async (sale) => {
    const newSale = { ...sale, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    setSales((current) => [newSale, ...current]);
    if (!cloud || !cloudInitializedRef.current) return;
    try {
      await setDoc(doc(cloud.salesRef, newSale.id), newSale);
      setSyncStatus(window.navigator.onLine ? "online" : "offline");
      setCloudError("");
    } catch (error) {
      console.error("Could not save the sale to Firebase.", error);
      setCloudError("Sale saved on this device but could not be shared. Check your account access.");
      setSyncStatus("offline");
    }
  }, [cloud]);

  const importSales = useCallback(async (importedSales) => {
    const records = importedSales.map((sale, index) => ({
      ...sale,
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    }));
    setSales((current) => [
      ...records,
      ...current.filter((sale) => !String(sale.id).startsWith("sample-")),
    ]);

    if (!cloud || !cloudInitializedRef.current) return records.length;

    try {
      for (let offset = 0; offset < records.length; offset += 450) {
        const batch = writeBatch(cloud.db);
        records.slice(offset, offset + 450).forEach((sale) => {
          batch.set(doc(cloud.salesRef, sale.id), sale);
        });
        await batch.commit();
      }
      setSyncStatus(window.navigator.onLine ? "online" : "offline");
      setCloudError("");
      return records.length;
    } catch (error) {
      console.error("Could not sync imported sales to Firebase.", error);
      setCloudError("Sales were imported on this device, but could not be shared. Check your account access.");
      setSyncStatus("offline");
      throw new Error("Sales were imported on this device, but cloud sync failed.");
    }
  }, [cloud]);

  const toggleSalePaid = useCallback(async (id) => {
    const sale = valuesRef.current.sales.find((item) => item.id === id);
    if (!sale) return;
    setSales((current) => current.map((sale) => sale.id === id ? { ...sale, paid: !sale.paid } : sale));
    if (!cloud || !cloudInitializedRef.current) return;
    try {
      await updateDoc(doc(cloud.salesRef, id), { paid: !sale.paid });
      setSyncStatus(window.navigator.onLine ? "online" : "offline");
    } catch (error) {
      console.error("Could not update the sale in Firebase.", error);
      setCloudError("Sale status could not be shared with other users.");
      setSyncStatus("offline");
    }
  }, [cloud]);

  const deleteSale = useCallback(async (id) => {
    setSales((current) => current.filter((sale) => sale.id !== id));
    if (!cloud || !cloudInitializedRef.current) return;
    try {
      await deleteDoc(doc(cloud.salesRef, id));
      setSyncStatus(window.navigator.onLine ? "online" : "offline");
    } catch (error) {
      console.error("Could not delete the sale from Firebase.", error);
      setCloudError("Sale was removed on this device but could not be shared.");
      setSyncStatus("offline");
    }
  }, [cloud]);

  const saveSupplies = useCallback((items) => setSupplies(items), []);
  const saveServices = useCallback((items) => setServices(items), []);
  const signIn = useCallback(async () => {
    if (!firebase) {
      setCloudError("Firebase is not configured correctly.");
      return;
    }
    setCloudError("");
    try {
      const provider = new GoogleAuthProvider();
      const currentUser = firebase.auth.currentUser;
      if (currentUser?.isAnonymous) {
        await linkWithPopup(currentUser, provider);
      } else {
        await signInWithPopup(firebase.auth, provider);
      }
    } catch (error) {
      console.error("Google sign-in failed.", error);
      setCloudError(error.code === "auth/operation-not-allowed"
        ? "Enable Google sign-in in Firebase Authentication before signing in."
        : "Google sign-in failed. Check Firebase Authentication settings and try again.");
    }
  }, [firebase]);
  const logOut = useCallback(async () => {
    if (!firebase) return;
    try {
      await signOut(firebase.auth);
      setCloudError("");
    } catch (error) {
      console.error("Could not sign out of Firebase.", error);
      setCloudError("Could not sign out. Please try again.");
    }
  }, [firebase]);

  const value = useMemo(() => ({
    sales,
    supplies,
    services,
    syncStatus,
    networkStatus,
    storageError,
    cloudError,
    user,
    authReady,
    signIn,
    logOut,
    addSale,
    importSales,
    toggleSalePaid,
    deleteSale,
    saveSupplies,
    saveServices,
  }), [sales, supplies, services, syncStatus, networkStatus, storageError, cloudError, user, authReady, signIn, logOut, addSale, importSales, toggleSalePaid, deleteSale, saveSupplies, saveServices]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider.");
  return context;
}
