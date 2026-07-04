import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

export type UserType = "senior" | "family";

type UserContextValue = {
  userType: UserType | null;
  isLoading: boolean;
  setUserType: (type: UserType) => Promise<void>;
  clearUserType: () => Promise<void>;
};

const USER_TYPE_KEY = "user_type";

const UserContext = createContext<UserContextValue>({
  userType: null,
  isLoading: true,
  setUserType: async () => {},
  clearUserType: async () => {},
});

// 앱 전체에 유저 유형(노년/가족)을 제공하는 Provider입니다.
// SecureStore에 저장하여 앱 재시작 후에도 선택값이 유지됩니다.
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserTypeState] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 유저 유형을 불러옵니다.
  useEffect(() => {
    SecureStore.getItemAsync(USER_TYPE_KEY)
      .then((Value) => {
        if (Value === "senior" || Value === "family") {
          setUserTypeState(Value);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function setUserType(type: UserType) {
    await SecureStore.setItemAsync(USER_TYPE_KEY, type);
    setUserTypeState(type);
  }

  async function clearUserType() {
    await SecureStore.deleteItemAsync(USER_TYPE_KEY);
    setUserTypeState(null);
  }

  return (
    <UserContext.Provider value={{ userType, isLoading, setUserType, clearUserType }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
