import loginReducer from "./loginSlice";
import tokenReducer from "./tokenSlice";
import inquiryReducer from "./inquirySlice";
import queriesReducer from "./queriesSlice"
import editPackage from "./packagesSlice"
import notify from "./notificationSlice"
import { combineReducers } from "redux";

const rootReducer = combineReducers({
	loggedinUser: loginReducer,
	tokens: tokenReducer,
	inquiries: inquiryReducer,
	package: editPackage,
	notification: notify,
	queries: queriesReducer
})

export default rootReducer;
