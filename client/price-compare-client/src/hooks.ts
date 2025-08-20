import { useState, useEffect } from "react";
import { useLoading } from "./components/LoadingSpinner";


export const useFetchData = <T>(
  retrieveData: () => Promise<T>,
  loadingMessage: string,
  failNotification: string,
  dependencies: any[] = []
) => {
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
        if (isMounted) setError(err);
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
// export const useFetchData2 = (url: string) => {
//     const { showLoading, hideLoading } = useLoading();
//     const [data, setData] = useState(null);

//     showLoading("Fetching Data...");

//   useEffect(() => {
//     fetch(url)
//       .then((res) => res.json())
//       .then((data) => {
//         setData(data);
//         hideLoading();
//       });
//   }, [url]);

//   return [data];
// };