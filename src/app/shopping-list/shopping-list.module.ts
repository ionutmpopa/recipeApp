import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../shared/share.module";
import { ShoppingEditComponent } from "./shopping-edit/shopping-edit.component";
import { ShoppingListRoutingModule } from "./shopping-list-routing.module";
import { ShoppingListComponent } from "./shopping-list.component";

@NgModule({
    declarations: [    
        ShoppingListComponent,
        ShoppingEditComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        ShoppingListRoutingModule
    ],
    exports: [        
        ShoppingListComponent,
        ShoppingEditComponent
    ]
})
export class ShoppingListModule {

}