export class User{
    name:string
    color?:string
    rol?:string
    _id!:string
    short?:string
    constructor(name:string,rol:string,color:string,id:string){
        this.name = name
        this.rol = rol
        this.color = color;
        this._id = id
    }
}