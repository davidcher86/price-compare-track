import { useState, useEffect } from "react";
import { useLoading } from "./components/LoadingSpinner";
import { useNotification } from "./components/Notifications";


export const useFetchData = <T>(
  retrieveData: () => Promise<T>,
  loadingMessage: string,
  failNotification: string,
  dependencies: any[] = []
) => {
  const { addNotification } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setError(null);

    showLoading(loadingMessage);
    retrieveData()
      .then(result => {
        if (isMounted) setData(result);
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          addNotification(failNotification, "error");
        }
      })
      .finally(() => {
        if (isMounted) hideLoading();
      });

    return () => {
      isMounted = false; // cancel state updates if component unmounts
    };
  }, []);

  return { data, setData, error };
}