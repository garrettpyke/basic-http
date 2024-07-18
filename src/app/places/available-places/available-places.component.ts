import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('');
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  // alternate method
  // constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.isFetching.set(true);

    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places')
      .pipe(
        map((resData) => resData.places),
        catchError((err) => {
          console.log(err);
          return throwError(() => new Error('Failed to fetch places data.'));
        })
      )
      .subscribe({
        next: (places) => this.places.set(places),
        error: (err: Error) => {
          console.log(err);
          this.error.set(err.message);
        },
        complete: () => this.isFetching.set(false),
      });

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }
}
