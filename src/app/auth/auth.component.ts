import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, Subscription } from "rxjs";
import { AuthResponseData, AuthService } from "./auth.service";
import * as fromApp from './../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {

    isLoginMode = true;
    isLoading = false;
    error: string = null;

    storeSub: Subscription;

    constructor(private authService: AuthService, 
                private router: Router,
                private store: Store<fromApp.AppState>) {}

    ngOnInit(): void {
        
        this.storeSub = this.store.select('auth').subscribe(authState => {
            this.isLoading = authState.loading;
            this.error = authState.authError;
        })
    }

    onSwitchMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(form: NgForm) {

        if (!form.valid) {
            return;
        }

        const email = form.value.email;
        const password = form.value.password;
        
        this.isLoading = true;

        if (this.isLoginMode) {
            this.store.dispatch(
                new AuthActions.LoginStart({ email: email, password: password }));
        } else {
            this.store.dispatch(
                new AuthActions.SignupStart({ email: email, password: password }));
        }
        form.reset();
    }

    onHandleError() {
        this.store.dispatch(new AuthActions.ClearError());
    }


    ngOnDestroy(): void {
        this.storeSub.unsubscribe();
    }

}