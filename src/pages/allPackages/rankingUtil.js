// rankingUtils.js
import { updatePackageRanking } from "../../api/packageAPI"; // adjust if using different API for places

/**
 * Handles changing ranking for a row (package or place)
 * @param {Object} row - The item row
 * @param {number} nextVal - New ranking value
 * @param {Array} allItems - Current array of all items
 * @param {Function} setAllItems - Setter for allItems state
 * @param {Object} rankingLoading - Object tracking loading state per item
 * @param {Function} setRankingLoading - Setter for rankingLoading state
 */
export const handleChangeRanking = async (
  row,
  nextVal,
  allItems,
  setAllItems,
  rankingLoading,
  setRankingLoading
) => {
  const id = row._id;
  const newRanking = Number(nextVal);

  setRankingLoading(prev => ({ ...prev, [id]: true }));

  const prevSnapshot = allItems;
  setAllItems(prev =>
    prev.map(item => (item._id === id ? { ...item, ranking: newRanking } : item))
  );

  try {
    await updatePackageRanking(id, { ranking: newRanking });
    setAllItems(prev =>
      prev.map(item => (item._id === id ? { ...item, updated_at: new Date().toISOString() } : item))
    );
  } catch (err) {
    console.error("Failed to update ranking", err);
    setAllItems(prevSnapshot);
  } finally {
    setRankingLoading(prev => ({ ...prev, [id]: false }));
  }
};

