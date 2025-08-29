import { User } from "../users-module/User"

export class Project{
    name:string
    idUser?:string
    _id?:string
    noSerie:string
    status = "No Status"
    user!:User
    logId?:string
    createdAt?:Date
    createdBy?:string
    count?:number
    constructor(name:string,noSerie:string,status="No Status"){
        this.name = name
        this.noSerie = noSerie
        this.status = status
    }

    setId(id:string){
        this._id = id
    }

    getProjectName(){
        return this.name
    }
    getProjectKey(){
        return this.noSerie
    }

    setStatus(status:string){
        this.status = status
    }
    setUser(user:User){
        this.user = user
    }

    getCountText(){
        return this.count? this.count +" planos":"Sin bitácora"
    }
    toApi(){
        return {
            name:this.name,
            createdBy:this.createdBy,
            noSerie:this.noSerie,
            idUser:this.user._id,
            status:this.status
        }
    }
    
}