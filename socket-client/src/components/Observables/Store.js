import { BehaviorSubject } from 'rxjs';

export const username$ = new BehaviorSubject(JSON.parse(localStorage.getItem('username') || null));


export function updateUsername(newUsername){
  if(newUsername){
    localStorage.setItem('username', JSON.stringify(newUsername));
  } else{
    localStorage.removeItem('username');
  }
  username$.next(newUsername);
}
