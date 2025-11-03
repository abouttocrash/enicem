"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MILESTONE_DESC = void 0;
exports.createMilestone = createMilestone;
var MILESTONE_DESC;
(function (MILESTONE_DESC) {
    MILESTONE_DESC["PROJECT_CREATED"] = "Proyecto creado";
    MILESTONE_DESC["CATALOG_CREATED"] = "Bit\u00E1cora creada";
    MILESTONE_DESC["CATALOG_UPDATED"] = "Cat\u00E1logo Actualizado";
    MILESTONE_DESC["ORDER_MAQUI_CREATED"] = "Orden de Maquinado Creada";
    MILESTONE_DESC["ORDER_DETAIL_CREATED"] = "Orden de Detalle Creada";
    MILESTONE_DESC["ORDER_MAQUI_UPDATED"] = "Orden de Maquinado Actualizada";
    MILESTONE_DESC["ORDER_DETAIL_UPDATED"] = "Orden DETALLE Actualizada";
    MILESTONE_DESC["ORDER_MAQUI_CLOSED"] = "Orden de Maquinado Cerrada";
    MILESTONE_DESC["ORDER_MAQUI_CANCELED"] = "Orden de Maquinado Cancelada";
    MILESTONE_DESC["ORDER_DETAIL_CLOSED"] = "Orden de Detalle Cerrada";
    MILESTONE_DESC["ORDER_DETAIL_CANCELED"] = "Orden de Detalle Cancelada";
})(MILESTONE_DESC || (exports.MILESTONE_DESC = MILESTONE_DESC = {}));
function createMilestone(description, generalId, createdBy, what, p, expand = true) {
    console.log(expand);
    const milestone = {
        description: description,
        generalId: generalId,
        createdBy: createdBy,
        expand: expand,
        what: what,
        proveedor: p
    };
    return milestone;
}
