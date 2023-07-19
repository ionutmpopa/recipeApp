import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, ofType, createEffect } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AuthService } from "../auth.service";
import { User } from "../user.model";
import * as AuthAction from './auth.actions';

export interface AuthResponseData {
    kind?: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable()
export class AuthEffects {

    authSignup = createEffect(() => 
    
        this.actions$.pipe(
            ofType(AuthAction.SIGNUP_START),
            switchMap((authData: AuthAction.SignupStart) => {
                return this.http.post<AuthResponseData>(
                    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
                        {
                            email: authData.payload.email,
                            password: authData.payload.password,
                            returnSecureToken: true
                        }
                    ).pipe(
                        map(resData => this.handleAuthentication(resData)),
                        catchError(errorRes => this.handleError(errorRes))
                    )
                }))
                );

    authLogin = createEffect(() => 
        this.actions$.pipe(
            ofType(AuthAction.LOGIN_START),
            switchMap((authData: AuthAction.LoginStart) => {
                return this.http.post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                    {
                        email: authData.payload.email,
                        password: authData.payload.password,
                        returnSecureToken: true
                    }
                ).pipe(
                    map(resData => this.handleAuthentication(resData)),
                    catchError(errorRes => this.handleError(errorRes))
                )
            }))
            );
        
        autoLogin = createEffect(() => 
            this.actions$.pipe(
                ofType(AuthAction.AUTO_LOGIN), 
                map(() => {
                    const data: {
                        email: string,
                        id: string,
                        _token: string,
                        _tokenExpirationDate: string
                    } = JSON.parse(localStorage.getItem('userData'));
                    if (!data) {
                        return { type: 'DUMMY' };
                    }
                    const loadedUser = new User(data.email, data.id, data._token, new Date(data._tokenExpirationDate));
            
                    if (loadedUser.token) {
                        const expirationDuration = new Date(data._tokenExpirationDate).getTime() - new Date().getTime();
                        this.authService.setLogoutTimer(expirationDuration);
                        return new AuthAction.AuthenticateSuccess(
                                {
                                    email: loadedUser.email, 
                                    userId: loadedUser.id, 
                                    token: loadedUser.token, 
                                    expirationDate: new Date(data._tokenExpirationDate),
                                    redirect: false
                                }
                            )
                    }
                    return { type: 'DUMMY' };
                })
            ));
                        
        authRedirect = createEffect(() => 
            this.actions$.pipe(
                ofType(AuthAction.AUTHENTICATE_SUCCESS), 
                tap((authSuccessAction: AuthAction.AuthenticateSuccess) => {

                    if (authSuccessAction.payload.redirect) {
                        this.router.navigate(['/']);
                    }
                })
            ),
            {dispatch: false} 
        );

        authLogout = createEffect(() => 
            this.actions$.pipe(
                ofType(AuthAction.LOGOUT), 
                tap(() => {
                    this.authService.clearLogoutTimer();
                    localStorage.removeItem('userData');
                    this.router.navigate(['/auth']);
                })
            ),
            {dispatch: false} 
        );
            
        

    constructor(private actions$: Actions, 
                private http: HttpClient, 
                private router: Router,
                private authService: AuthService) {}

    private handleAuthentication(resData: AuthResponseData) {
        const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
        const user = new User(resData.email, resData.localId, resData.idToken, expirationDate);
        localStorage.setItem('userData', JSON.stringify(user));
        this.authService.setLogoutTimer(+resData.expiresIn * 1000);
        return new AuthAction.AuthenticateSuccess(
                {
                    email: resData.email, 
                    userId: resData.localId, 
                    token: resData.idToken, 
                    expirationDate: expirationDate,
                    redirect: true
                }
            )
    }

    private handleError(errorRes: any) {
        let errorMessage = 'An unknown error occurred';
        if (!errorRes.error || !errorRes.error.error) {
            return of(new AuthAction.AuthenticateFail(errorMessage));
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'The email address is already in use by another account.';
                break;
            case 'OPERATION_NOT_ALLOWED':
                errorMessage = 'Password sign-in is disabled for this project.';
                break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage ='There is no user record corresponding to this identifier. The user may have been deleted.';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'The password is invalid or the user does not have a password.';
                break;
            case 'USER_DISABLED':
                errorMessage = 'The user account has been disabled by an administrator.';
                break;
            default:
                break;
        }
        return of(new AuthAction.AuthenticateFail(errorMessage));
    }

}
