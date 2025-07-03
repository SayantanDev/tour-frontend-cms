import loginReducer from "./loginSlice";
import tokenReducer from "./tokenSlice";
import inquiryReducer from "./inquirySlice";
import queriesReducer from "./queriesSlice"
import editPackage from "./packagesSlice"
import notify from "./notificationSlice"
import configReducer from "./configSlice"
import placeReducer from "./placesSlice"
import ctgReducer from "./ctgpackageSlice"
import { combineReducers } from "redux";

const rootReducer = combineReducers({
	loggedinUser: loginReducer,
	tokens: tokenReducer,
	inquiries: inquiryReducer,
	package: editPackage,
	notification: notify,
	queries: queriesReducer,
	config: configReducer,
	place: placeReducer,
	ctgpakage: ctgReducer,
})

export default rootReducer;
