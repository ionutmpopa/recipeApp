import {
  Component,
  OnDestroy,
  OnInit,
  resolveForwardRef
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs-compat';
import { Subscription } from 'rxjs/internal/Subscription';

import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from '../shopping-list.action';
import * as fromApp from '../../store/app.reducer';


@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {

  startedEditingSubscription: Subscription;

  editMode = false;
  editedItem: Ingredient;
  shoppingForm : FormGroup;

  constructor(private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.startedEditingSubscription = this.store.select('shoppingList').subscribe(stateData => {
      if (stateData.editedIngredientIndex > -1) {
        this.editMode = true;
        this.editedItem = stateData.editedIngredient;
        this.shoppingForm.setValue({
          'name': this.editedItem.name,
          'amount': this.editedItem.amount
        })
      } else {
        this.editMode = false;
      }
    });

    this.shoppingForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'amount': new FormControl(null, [Validators.required], this.forbiddenNegativeNumber.bind(this))
    })
  }

  onAddItem() {
    console.log(this.shoppingForm);

    const ingName = this.shoppingForm.get('name').value;
    const ingAmount = this.shoppingForm.get('amount').value;
    const newIngredient = new Ingredient(ingName, ingAmount);

    if (!this.editMode) {
      this.store.dispatch(new ShoppingListActions.AddIngredient(newIngredient));
    } else {
      this.store.dispatch(new ShoppingListActions.UpdateIngredient(newIngredient));
      
    }
    this.shoppingForm.reset();
    this.editMode = false;
  }

  onClear() {
    this.shoppingForm.reset();
    this.editMode = false;
    this.store.dispatch(new ShoppingListActions.StopEdit())
  }

  onDelete() {
    this.store.dispatch(new ShoppingListActions.DeleteIngredient());
    this.onClear();
  }

  forbiddenNegativeNumber(control: FormControl): Promise<any> | Observable<any> {

    let exactMatch = new RegExp("^[1-9]+[0-9]*$");

    const promise = new Promise(
      (resolve, reject) => {
        if (String(control.value).match(exactMatch) === null) {
          return resolve({'negativeValueIsForbidden': true});
        } else {
          return resolve(null);
        }
      }
    );
    return promise;

  }

  ngOnDestroy(): void {
    this.store.dispatch(new ShoppingListActions.StopEdit());
    this.startedEditingSubscription.unsubscribe();
  }

}
