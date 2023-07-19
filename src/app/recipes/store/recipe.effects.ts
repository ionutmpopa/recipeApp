import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { map, switchMap, withLatestFrom } from "rxjs/operators";
import { Recipe } from "../recipe.model";

import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from './recipe.actions';

@Injectable()
export class RecipeEffects {

    fetchRecipes = createEffect(() =>
        this.actions$.pipe(
            ofType(RecipesActions.FETCH_RECIPES),
            switchMap(() => {
                return this.http
                    .get<Recipe[]>(
                        'https://ng-course-recipe-book-aab00-default-rtdb.europe-west1.firebasedatabase.app/recipes.json'
                    )
            }),
            map(recipes => new RecipesActions.AddRecipes(recipes ? recipes.map(recipe => ({ ingredients: [], ...recipe })) : []))

        )
    );

    storeRecipes = createEffect(() =>
        this.actions$.pipe(
            ofType(RecipesActions.STORE_RECIPES),
            withLatestFrom(this.store.select('recipes')),
            switchMap(([actionData, recipeState]) => {
                return this.http
                    .put('https://ng-course-recipe-book-aab00-default-rtdb.europe-west1.firebasedatabase.app/recipes.json', 
                    recipeState.recipes
                )
            })
        ), 
        {dispatch: false}
        );
            

    constructor(private actions$: Actions, 
                private http: HttpClient,
                private store: Store<fromApp.AppState>) {}

}