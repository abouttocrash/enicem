export interface Usuario{
    _id:string
    name:string
    color:string
    short:string
    rol?:string,
    actions:string[],
    code?:string
    active?:boolean
    isActive?:string
}