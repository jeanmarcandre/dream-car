import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SellVeh } from 'src/app/interfaces/sell-veh';
import { ToSellsArrayService } from 'src/app/services/to-sells-array.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  toSells: SellVeh[] = [];

  subscription!: Subscription;

  vehicleForm!: FormGroup;

  currentVehPicture!: any;

  currentVehPictureUrl!: string;

  constructor(
    private formBuilder: FormBuilder,
    private toSellsArrayService: ToSellsArrayService
  ) { }
  

  initForm(): void {
    this.vehicleForm = this.formBuilder.group({
      id: [null],
      seller: ['', [Validators.required, Validators.minLength(3)]],
      picture: [],
      brand: '',
      model: '',
      description: '',
      price: 0
    });
  }

  onChangePicture($event: any): void {
    this.currentVehPicture = $event.target.files[0];
    const fileReader = new FileReader();// Me permet de lire des fichiers
    fileReader.readAsDataURL(this.currentVehPicture);
    fileReader.onloadend = (e) => { // e pour evenement
      this.currentVehPictureUrl = <string>e.target?.result;
    }
  }

  onSubmitForm(): void {
    // console.log(this.vehicleForm.value);
    const toSellId = this.vehicleForm.value.id;
    let toSell = this.vehicleForm.value;
    if (!toSellId || toSellId && toSellId === '') {
      // Partie création
      delete toSell.id;
      this.toSellsArrayService.createSell(toSell, this.currentVehPicture)
      // .then(veh => {
      //   this.toSells.push(veh);
      // })
      .catch(console.error);
    } else {
      // Ma modification (l'édition)
      console.log('valeur de toSell.id dans le else', toSell.id)
      delete toSell.id;
      
      this.toSellsArrayService.editSell(toSell, toSellId)
      .catch(console.error);
    }
    this.vehicleForm.reset();
    this.currentVehPicture = null;
  }

  onEditVehicle(toSell: SellVeh): void {
    this.vehicleForm.setValue({
      id: toSell.id ? toSell.id : '',
      seller: toSell.seller ? toSell.seller : '',
      brand: toSell.brand ? toSell.brand : '',
      model: toSell.model ? toSell.model : '',
      description: toSell.description ? toSell.description : '',
      price: toSell.price ? toSell.price : 0
    });
  }

  onDeleteVehicle(toSellId?: string) :void
 {
   if (toSellId) {
    this.toSellsArrayService.deleteSell(toSellId).catch(console.error);
   } else {
     console.error('L\'ID est undefined, un id doit erte fournit pour supprimer une annonce');
   }
   
 }


  // ngOnInit(): void {
  //   // console.log(this.activatedRoute.snapshot.paramMap.get('id'));
  //   // const carId = this.activatedRoute.snapshot.paramMap.get('id');
  //   // this.initCar = this.cars.find(car => car.id === +<string>carId);
  //   // console.log(car);
  //   this.initForm();
  //   this.toSellsArrayService.getSells()
  //   .then((toSells: SellVeh[]) => {
  //     this.toSells = toSells;
  //   }).catch((error) => {
  //     console.error(error);
  //   });
  // }

  ngOnInit(): void {
    // console.log(this.activatedRoute.snapshot.paramMap.get('id'));
    // const carId = this.activatedRoute.snapshot.paramMap.get('id');
    // this.initCar = this.cars.find(car => car.id === +<string>carId);
    // console.log(car);
    this.initForm();
    this.subscription = this.toSellsArrayService.toSellsSubject.subscribe({
      next: (toSells: SellVeh[]) => { 
        this.toSells = toSells;
      },
      // complete: () => { 
      //   console.log('C\'est fini mec !') 
      // },
      error: (error) => { 
        console.error(error); 
      }
    });
    this.toSellsArrayService.getSells();
    console.log(this.toSells);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe;
  }


}
