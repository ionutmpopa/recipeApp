import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipesActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {

  isAuthenticated = false;
  private userSubscription: Subscription;

  constructor(private store: Store<fromApp.AppState>) {}

ngOnInit(): void {
  this.userSubscription = this.store.select('auth')
  .pipe(
    map(authState => authState.user)
  )
  .subscribe(
    userData => {
    this.isAuthenticated = !userData ? false : true;
  });
}

  onSaveData() {
    this.store.dispatch(new RecipesActions.StoreRecipes());
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout());
  }

  onFetchData() {
    this.store.dispatch(new RecipesActions.FetchRecipes());
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

}
