 
 //TODO: Mejorar para Ctrl + a 
 export function isNumber($event:KeyboardEvent){
    const input = $event.target as HTMLInputElement;
    let value = ""
    if($event.key.length === 1)
      value = input.value + $event.key;
    
    if (!/^\d*$/.test(value) && $event.key.length === 1) 
      $event.preventDefault();
}