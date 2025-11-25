import { useState, useEffect } from 'react';
import { Firestore, collection, query, where, getDocs } from 'firebase/firestore';

interface VehicleRatings {
  [vehicleId: string]: {
    average: number;
    count: number;
  };
}

export function useVehicleRatings(firestore: Firestore | null, vehicleIds: string[]) {
  const [ratings, setRatings] = useState<VehicleRatings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!firestore || vehicleIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const ratingsRef = collection(firestore, 'ratings');
        const ratingsMap: VehicleRatings = {};

        // Initialize all vehicles with 0 rating
        vehicleIds.forEach(id => {
          ratingsMap[id] = { average: 0, count: 0 };
        });

        // Fetch ratings for all vehicles
        const promises = vehicleIds.map(async (vehicleId) => {
          const q = query(ratingsRef, where('vehicleId', '==', vehicleId));
          const querySnapshot = await getDocs(q);
          
          let totalRating = 0;
          let count = 0;

          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            totalRating += data.rating;
            count++;
          });

          ratingsMap[vehicleId] = {
            average: count > 0 ? totalRating / count : 0,
            count,
          };
        });

        await Promise.all(promises);
        setRatings(ratingsMap);
      } catch (err) {
        console.error('Error fetching vehicle ratings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [firestore, vehicleIds.join(',')]);

  return { ratings, isLoading };
}

