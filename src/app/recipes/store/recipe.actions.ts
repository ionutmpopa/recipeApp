import { Action } from "@ngrx/store";
import { Recipe } from "../recipe.model";

export const ADD_RECIPE = '[Recipes] Add Recipe';
export const ADD_RECIPES = '[Recipes] Add Recipes';
export const UPDATE_RECIPE = '[Recipes] Update Recipe';
export const DELETE_RECIPE = '[Recipes] Delete Recipe';
export const FETCH_RECIPES = '[Recipes] Fetch Recipes';
export const STORE_RECIPES = '[Recipes] Store Recipes';

export class AddRecipe implements Action {
    readonly type = ADD_RECIPE;
    constructor(public payload: Recipe) {}
}

export class AddRecipes implements Action {
    readonly type = ADD_RECIPES;
    constructor(public payload: Recipe[]) {}
}

export class UpdateRecipe implements Action {
    readonly type = UPDATE_RECIPE;
    constructor(public payload: {index: number, newRecipe: Recipe}) {}
}

export class FetchRecipes implements Action {
    readonly type = FETCH_RECIPES;
}

export class StoreRecipes implements Action {
    readonly type = STORE_RECIPES;
}

export class DeleteRecipe implements Action {
    readonly type = DELETE_RECIPE;
    constructor(public payload: number){}
}

export type RecipeActions = AddRecipe | AddRecipes | FetchRecipes | DeleteRecipe | UpdateRecipe | StoreRecipes;