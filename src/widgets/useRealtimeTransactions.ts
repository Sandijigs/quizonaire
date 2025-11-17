import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { somniaSubGraphApi, somniaSubgraphConfig } from '@/shared/apis';

export const useRealtimeTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    try {
      const runQuery = async () => {
        const url = `${somniaSubGraphApi}/transactions`;
        const response = await axios.get(url, somniaSubgraphConfig);
        const transactions = response?.data?.transactions ?? [];
        setTransactions(transactions);
      };

      runQuery();

      const interval = setInterval(runQuery, 5000);

      return () => {
        clearInterval(interval);
      };
    } catch (error) {
      console.error(error);
    }
  }, []);

  return useMemo(
    () => ({
      transactions,
    }),
    [transactions]
  );
};
