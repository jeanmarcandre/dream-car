import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BehaviorSubject } from 'rxjs';
import { SellVeh } from '../interfaces/sell-veh';

@Injectable({
  providedIn: 'root'
})
export class ToSellsArrayService {

  //Ma base de données
  private toSells: SellVeh[] = [];

  toSellsSubject: BehaviorSubject<SellVeh[]> = new BehaviorSubject(<SellVeh[]>[]);

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage
  ) {

   }

  // Ma méthode de récupération des véhicules en vente
  // getSells(): Promise<SellVeh[]> {
  //   //return d'un tableau d'offres
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       if (this.toSells.length === 0) {
  //         reject(new Error('Aucun véhicule enregistré'));
  //       }
  //       resolve(this.toSells);
  //     }, 4000);
  //   });
  // }

  // getSells(): Observable<SellVeh[]> {
  //   //return d'un tableau d'offres
  //   return new Observable(observer => {
  //     if (this.toSells.length === 0) {
  //       observer.error(new Error('On a rien trouvé mec !'));
  //     }
  //     setInterval(() => {
  //       observer.next(this.toSells);
  //       // observer.complete();
  //     }, 2000);
  //   });
  // }

  getSells(): void {
    this.db.list('Annonces').query.limitToLast(10).once('value', snapshot => {
      const vehicleSnapValue = snapshot.val();
      if (vehicleSnapValue) {
        const vehSells = Object.keys(vehicleSnapValue).map(id => ({id, ...vehicleSnapValue[id]}));
        this.toSells = vehSells;
      }
      this.dispatchToSells();
    });
  }


  // Ma méthode de création d'un véhicule en vente
  async createSell(toSell: SellVeh, vehPicture?: any): Promise<SellVeh> {
    // On aura besoin de l'annonce à créer (toSell) qui sera du type de notre interface (SellVeh)
    // Elle va renvoyer le nouvel etat de SellVeh (le tableau des offres)
    try {
      const pictureUrl = vehPicture ? await this.uploadPicture(vehPicture): '';
      const reponse = this.db.list('Annonces').push({...toSell, picture: pictureUrl});
      const createdVeh = {...toSell, picture: pictureUrl, id: <string>reponse.key};
      this.toSells.push(createdVeh);
      this.dispatchToSells(); // on va emettre le nouvel etat du tableau
      return createdVeh;
    } catch(error) {
      throw error;
    }
  }

  // Ma méthode d'édition
  editSell(toSell: SellVeh, toSellId: string): Promise<SellVeh> {
    // Ici on a besoin de l'offre et de son index avant de renvoyer le tableau mis a jour
    // this.toSells[index] = toSell;
    // return this.toSells;
    return new Promise((resolve, reject) => {
      this.db.list('Annonces').update(toSellId, toSell)
      .then(() => {
        const editVeh = {...toSell, id: toSellId};
        const vehToUpdtId = this.toSells.findIndex(el => el.id === toSellId);
        this.dispatchToSells(); // on va emettre le nouvel etat du tableau
        resolve(editVeh);
      }).catch(reject);
    });
  }

  // Ma methode de suppression
  async deleteSell(toSellId: string): Promise<SellVeh> {
    // On demande l'index d'une annonce et on renvoie le tableau mis à jour 
    try {
      const vehToDeleteId = this.toSells.findIndex(el => el.id === toSellId);
      const vehToDelete = this.toSells[vehToDeleteId];
      if (vehToDelete.picture && vehToDelete.picture !== '') {
        await this.removePicture(vehToDelete.picture);
      }
      await this.db.list('Annonces').remove(toSellId);
      this.toSells.splice(vehToDeleteId, 1);
      this.dispatchToSells();
      return vehToDelete;
    } catch(error) {
      throw error;
    }
  }



  // Ma methode de suppression
  // deleteSell(toSellIndex: number): SellVeh[] {
  //   // On demande l'index d'une annonce et on renvoie le tableau mis à jour
  //   this.toSells.splice(toSellIndex, 1);
  //   return this.toSells;
  // }

  dispatchToSells() {
    this.toSellsSubject.next(this.toSells);
  }


  //Méthode privée accessible seulement depuis la calsse service
  private uploadPicture(picture: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = this.storage.upload('Annonces/' + picture.name, picture);
      upload.then((res) => {
        resolve(res.ref.getDownloadURL());
      }).catch(reject);
    });
  }

  //Méthode de suppression privée accessible seulement depuis la calsse service
  private removePicture(pictureUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.refFromURL(pictureUrl).delete().subscribe({
        complete: () => resolve({}),
        error: reject
      });
    });
  }
}