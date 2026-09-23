import { db, auth } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

export const ADMIN_EMAIL = "kojiacademy2026@gmail.com";

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
}

export interface PurchaseRecord {
  id: string;
  productItem: string;
  tier: 'Free' | 'FrontEnd' | 'OTO1' | 'OTO2';
  credits: number;
  amount: string;
  date: number;
  txnId: string;
}

export interface RegisteredUser {
  uid: string;
  email: string;
  displayName: string;
  tier: 'Free' | 'FrontEnd' | 'OTO1' | 'OTO2';
  credits: number;
  isBanned: boolean;
  lastActive: number;
  createdAt: number;
  purchaseHistory?: PurchaseRecord[];
}

export interface IpnPendingPurchase {
  id: string;
  buyerEmail: string;
  productItem: string;
  creditsAssigned: number;
  tier: 'Free' | 'FrontEnd' | 'OTO1' | 'OTO2';
  dateReceived: number;
  txnId: string;
}

export const adminService = {
  /**
   * Tracks user activity and syncs real account state to registeredUsers collection in Firestore.
   * Special grant for kojiacademy2026@gmail.com as the primary Administrator.
   */
  trackUserActivity: async (user: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  }): Promise<{ isBanned: boolean; matchedPurchases: number }> => {
    if (!user.uid) return { isBanned: false, matchedPurchases: 0 };

    const cleanEmail = (user.email || "").toLowerCase().trim();
    const isAdmin = isUserAdmin(cleanEmail);

    try {
      const userDocRef = doc(db, "registeredUsers", user.uid);
      const userSnap = await getDoc(userDocRef);

      let isBanned = false;
      let currentTier: 'Free' | 'FrontEnd' | 'OTO1' | 'OTO2' = isAdmin ? "OTO2" : "FrontEnd";
      let currentCredits = isAdmin ? 99999 : 1000;
      let history: PurchaseRecord[] = [];

      const displayName = user.displayName || (isAdmin ? "Koji Academy Admin" : cleanEmail.split("@")[0] || "Author");

      if (userSnap.exists()) {
        const data = userSnap.data() as RegisteredUser;
        isBanned = isAdmin ? false : Boolean(data.isBanned);
        currentTier = isAdmin ? "OTO2" : (data.tier || "FrontEnd");
        currentCredits = isAdmin ? Math.max(99999, data.credits || 99999) : (typeof data.credits === "number" ? data.credits : 1000);
        history = Array.isArray(data.purchaseHistory) ? data.purchaseHistory : [];

        await updateDoc(userDocRef, {
          lastActive: Date.now(),
          email: cleanEmail || data.email,
          displayName: displayName || data.displayName,
          tier: currentTier,
          credits: currentCredits,
          isBanned,
        });
      } else {
        const newUser: RegisteredUser = {
          uid: user.uid,
          email: cleanEmail,
          displayName,
          tier: currentTier,
          credits: currentCredits,
          isBanned: false,
          lastActive: Date.now(),
          createdAt: Date.now(),
          purchaseHistory: isAdmin
            ? [
                {
                  id: "admin_grant_init",
                  productItem: "Ocean Novel Studio - Super Admin License",
                  tier: "OTO2",
                  credits: 99999,
                  amount: "Unlimited",
                  date: Date.now(),
                  txnId: "ADMIN-SUPER-PERM",
                },
              ]
            : [],
        };

        await setDoc(userDocRef, newUser);
      }

      // Check if this real email has any pending WarriorPlus IPN purchases waiting to be reconciled
      let matchedPurchases = 0;
      if (cleanEmail) {
        try {
          const pendingCol = collection(db, "ipnPendingPurchases");
          const q = query(pendingCol, where("buyerEmail", "==", cleanEmail));
          const snap = await getDocs(q);

          if (!snap.empty) {
            for (const docItem of snap.docs) {
              const pendingData = docItem.data() as IpnPendingPurchase;
              matchedPurchases++;
              currentCredits += (pendingData.creditsAssigned || 0);

              if (pendingData.tier === "OTO2") {
                currentTier = "OTO2";
              } else if (pendingData.tier === "OTO1" && currentTier !== "OTO2") {
                currentTier = "OTO1";
              } else if (pendingData.tier === "FrontEnd" && currentTier === "Free") {
                currentTier = "FrontEnd";
              }

              history.push({
                id: "auto_" + docItem.id,
                productItem: pendingData.productItem,
                tier: pendingData.tier,
                credits: pendingData.creditsAssigned,
                amount: pendingData.tier === "OTO2" ? "$67.00" : pendingData.tier === "OTO1" ? "$47.00" : "$27.00",
                date: Date.now(),
                txnId: pendingData.txnId || "WP-AUTO-" + Date.now().toString(36).toUpperCase(),
              });

              await deleteDoc(docItem.ref);
            }

            await updateDoc(userDocRef, {
              tier: currentTier,
              credits: currentCredits,
              purchaseHistory: history,
            });
          }
        } catch (reconcileErr) {
          console.warn("Real IPN auto-reconcile check notice:", reconcileErr);
        }
      }

      return { isBanned, matchedPurchases };
    } catch (err) {
      console.warn("trackUserActivity error:", err);
      return { isBanned: false, matchedPurchases: 0 };
    }
  },

  /**
   * Check if specific UID is banned
   */
  isUserBanned: async (uid: string): Promise<boolean> => {
    try {
      const snap = await getDoc(doc(db, "registeredUsers", uid));
      if (snap.exists()) {
        return Boolean(snap.data()?.isBanned);
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Get all registered users from Firestore database
   */
  getAllUsers: async (): Promise<RegisteredUser[]> => {
    try {
      const colRef = collection(db, "registeredUsers");
      const snap = await getDocs(colRef);

      const users: RegisteredUser[] = [];
      snap.forEach((d) => {
        users.push({ ...d.data(), uid: d.id } as RegisteredUser);
      });

      // If current logged-in user isn't in Firestore yet, sync them right now
      const cur = auth.currentUser;
      if (cur && !users.some((u) => u.uid === cur.uid)) {
        const cleanEmail = (cur.email || "").toLowerCase().trim();
        const isAdmin = isUserAdmin(cleanEmail);
        const liveUser: RegisteredUser = {
          uid: cur.uid,
          email: cleanEmail,
          displayName: cur.displayName || (isAdmin ? "Koji Academy Admin" : "Author"),
          tier: isAdmin ? "OTO2" : "FrontEnd",
          credits: isAdmin ? 99999 : 1000,
          isBanned: false,
          lastActive: Date.now(),
          createdAt: Date.now(),
          purchaseHistory: isAdmin
            ? [
                {
                  id: "admin_grant_init",
                  productItem: "Ocean Novel Studio - Super Admin License",
                  tier: "OTO2",
                  credits: 99999,
                  amount: "Unlimited",
                  date: Date.now(),
                  txnId: "ADMIN-SUPER-PERM",
                },
              ]
            : [],
        };

        try {
          await setDoc(doc(db, "registeredUsers", cur.uid), liveUser);
          users.push(liveUser);
        } catch (e) {
          console.warn("Could not auto-write current user to CRM:", e);
        }
      }

      // Sort by lastActive descending
      return users.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
    } catch (err) {
      console.warn("getAllUsers Firestore query notice:", err);
      return [];
    }
  },

  /**
   * Adjust Credits for User in Firestore
   */
  updateCredits: async (uid: string, credits: number): Promise<void> => {
    const userDocRef = doc(db, "registeredUsers", uid);
    await updateDoc(userDocRef, { credits: Math.max(0, credits) });
  },

  /**
   * Upgrade Tier for User in Firestore
   */
  updateTier: async (uid: string, tier: 'Free' | 'FrontEnd' | 'OTO1' | 'OTO2'): Promise<void> => {
    const userDocRef = doc(db, "registeredUsers", uid);
    await updateDoc(userDocRef, { tier });
  },

  /**
   * Ban or Unban User in Firestore
   */
  setUserBanned: async (uid: string, isBanned: boolean): Promise<void> => {
    const userDocRef = doc(db, "registeredUsers", uid);
    await updateDoc(userDocRef, { isBanned });
  },

  /**
   * Delete User Record from CRM
   */
  deleteUserRecord: async (uid: string): Promise<void> => {
    const userDocRef = doc(db, "registeredUsers", uid);
    await deleteDoc(userDocRef);
  },

  /**
   * Get Pending Purchases from Firestore
   */
  getPendingPurchases: async (): Promise<IpnPendingPurchase[]> => {
    try {
      const colRef = collection(db, "ipnPendingPurchases");
      const snap = await getDocs(colRef);

      const list: IpnPendingPurchase[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as IpnPendingPurchase);
      });

      return list.sort((a, b) => (b.dateReceived || 0) - (a.dateReceived || 0));
    } catch (err) {
      console.warn("getPendingPurchases error:", err);
      return [];
    }
  },

  /**
   * Delete Pending Purchase (e.g. Refunded order)
   */
  deletePendingPurchase: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, "ipnPendingPurchases", id));
  },

  /**
   * Simulate WarriorPlus IPN Webhook with English status responses
   */
  simulateIpnWebhook: async (payload: {
    buyerEmail: string;
    productItem: string;
    creditsAssigned: number;
    tier: 'Free' | 'FrontEnd' | 'OTO1' | 'OTO2';
    txnId?: string;
  }): Promise<{ matchedUser: boolean; message: string; targetUser?: string }> => {
    const cleanEmail = payload.buyerEmail.toLowerCase().trim();
    const txnId = payload.txnId || "WP-TXN-" + Math.floor(100000 + Math.random() * 900000);

    try {
      const usersCol = collection(db, "registeredUsers");
      const q = query(usersCol, where("email", "==", cleanEmail));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        // User account exists! Instantly upgrade tier and credit them
        const userDoc = querySnap.docs[0];
        const userData = userDoc.data() as RegisteredUser;

        const currentCredits = (userData.credits || 0) + payload.creditsAssigned;
        const newHistory: PurchaseRecord[] = [
          ...(userData.purchaseHistory || []),
          {
            id: "ipn_" + Date.now(),
            productItem: payload.productItem,
            tier: payload.tier,
            credits: payload.creditsAssigned,
            amount: payload.tier === "OTO2" ? "$67.00" : payload.tier === "OTO1" ? "$47.00" : "$27.00",
            date: Date.now(),
            txnId,
          },
        ];

        await updateDoc(userDoc.ref, {
          tier: payload.tier,
          credits: currentCredits,
          purchaseHistory: newHistory,
        });

        return {
          matchedUser: true,
          targetUser: userData.displayName || cleanEmail,
          message: `IPN Reconciled: Matched active user account "${userData.displayName || cleanEmail}". Tier upgraded to ${payload.tier} and +${payload.creditsAssigned.toLocaleString()} credits added.`,
        };
      } else {
        // User has not registered yet. Store in Pending Purchases table in Firestore
        const pendId = "wp_pend_" + Date.now();
        const pendingItem: IpnPendingPurchase = {
          id: pendId,
          buyerEmail: cleanEmail,
          productItem: payload.productItem,
          creditsAssigned: payload.creditsAssigned,
          tier: payload.tier,
          dateReceived: Date.now(),
          txnId,
        };

        await setDoc(doc(db, "ipnPendingPurchases", pendId), pendingItem);

        return {
          matchedUser: false,
          message: `IPN Logged: Buyer "${cleanEmail}" does not have an account yet. Recorded in Pending Purchases. The system will automatically fulfill their ${payload.tier} tier and credits once they sign up.`,
        };
      }
    } catch (err: any) {
      console.error("simulateIpnWebhook error:", err);
      throw new Error(err.message || "Failed to process simulated IPN webhook.");
    }
  },
};
