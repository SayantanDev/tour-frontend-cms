// rankingUtils.js
import { updatePlaceRanking } from "../../api/placeApi";

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
  //console.log("newRanking : ", newRanking);
  
  
  setRankingLoading(prev => ({ ...prev, [id]: true }));

  const prevSnapshot = allItems;
  setAllItems(prev =>
    prev.map(item => (item._id === id ? { ...item, ranking: newRanking } : item))
  );

  try {
    await updatePlaceRanking(id, { ranking: newRanking });
    
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

