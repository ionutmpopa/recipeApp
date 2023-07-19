import { Action } from "@ngrx/store";
import { User } from "../user.model";
import * as AuthActions from "./auth.actions";

export interface State {
    user: User;
    authError: string;
    loading: boolean;
}


const initialState: State = {
    user: null,
    authError: null,
    loading: false       
};


export function authReducer(state = initialState, action: AuthActions.AuthActions) {

    switch(action.type) {
        case AuthActions.AUTHENTICATE_SUCCESS:
            const user = new User(action.payload.email, action.payload.userId, action.payload.token, action.payload.expirationDate);
            return {
                ...state,
                authError: null,
                user: user,
                loading: false
            };
        case AuthActions.LOGOUT:
            return {
                ...state,
                user: null,
                loading: false
            };
        case AuthActions.SIGNUP_START:
        case AuthActions.LOGIN_START:
            return {
                ...state,
                authError: null,
                loading: true
            };
        case AuthActions.AUTHENTICATE_FAIL:
            return {
                ...state,
                authError: action.payload,
                user: null,
                loading: false
            };
        case AuthActions.CLEAR_ERROR:
            return {
                ...state,
                authError: null,
                loading: false
            };
        default:
            return state;
    }
}