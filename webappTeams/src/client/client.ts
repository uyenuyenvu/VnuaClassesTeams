// Default entry point for client scripts
// Automatically generated
// Please avoid from modifying to much...
import * as ReactDOM from "react-dom";
import * as React from "react";
import { configureStore } from "@reduxjs/toolkit";
export const render = (type: any, element: HTMLElement) => {
    ReactDOM.render(React.createElement(type, {}), element);
};

export const store = configureStore({
    reducer: (state, action) => {
        return {
            ...state,
            currentAuth: action.currentAuth ? action.currentAuth : {},
            appToken: action.appToken ? action.appToken : "",
            msToken: action.msToken ? action.msToken : "",
        }
    }
})
// Automatically added for the vnuaClassesTab tab
export * from "./vnuaTeamsTab/VnuaTeamsTab";

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
