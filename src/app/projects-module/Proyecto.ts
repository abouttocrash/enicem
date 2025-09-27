import { User } from "../users-module/User"

export class Project{
    name:string
    idUser?:string // TODO: es el id del designer, quitar y agregarlo desde el BE
    _id?:string
    noSerie:string
    status = "No Status"
    designer!:User
    catalogId?:string
    createdAt?:Date
    createdBy?:string
    count?:number
    constructor(project:Project){
        this.name = project.name
        this.noSerie = project.noSerie
        this.status = project.status
        this._id = project._id
        this.catalogId = project.catalogId
        this.createdBy = project.createdBy
        this.createdAt = project.createdAt
        this.count = project.count
    }

    getProjectKey(){
        return this.noSerie
    }

    setStatus(status:string){
        this.status = status
    }
    setUser(designer:User){
        this.designer = designer
    }

    
    toApi(){
        return {
            name:this.name,
            createdBy:this.createdBy,
            noSerie:this.noSerie,
            idUser:this.designer._id,
            status:this.status
        }
    }
    
}