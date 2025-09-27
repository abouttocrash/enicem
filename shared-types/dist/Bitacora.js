"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MILESTONE_DESC = void 0;
exports.createMilestone = createMilestone;
var MILESTONE_DESC;
(function (MILESTONE_DESC) {
    MILESTONE_DESC["PROJECT_CREATED"] = "PROYECTO CREADO";
    MILESTONE_DESC["CATALOG_CREATED"] = "CATALOGO CREADO";
    MILESTONE_DESC["CATALOG_UPDATED"] = "CATALOGO ACTUALIZADO";
    MILESTONE_DESC["ORDER_MAQUI_CREATED"] = "ORDEN MAQUINADO CREADA";
    MILESTONE_DESC["ORDER_DETAIL_CREATED"] = "ORDEN DETALLE CREADA";
    MILESTONE_DESC["ORDER_MAQUI_UPDATED"] = "ORDEN MAQUINADO ACTUALIZADA";
    MILESTONE_DESC["ORDER_DETAIL_UPDATED"] = "ORDEN DETALLE ACTUALIZADA";
    MILESTONE_DESC["ORDER_MAQUI_CLOSED"] = "ORDEN MAQUINADO CERRADA";
    MILESTONE_DESC["ORDER_MAQUI_CANCELED"] = "ORDEN MAQUINADO CANCELADA";
    MILESTONE_DESC["ORDER_DETAIL_CLOSED"] = "ORDEN DETALLE CERRADA";
    MILESTONE_DESC["ORDER_DETAIL_CANCELED"] = "ORDEN DETALLE CANCELADA";
})(MILESTONE_DESC || (exports.MILESTONE_DESC = MILESTONE_DESC = {}));
function createMilestone(description, generalId, createdBy, what, expand = true) {
    const milestone = {
        description: description,
        generalId: generalId,
        createdBy: createdBy,
        expand: expand,
        what: what
    };
    return milestone;
}
