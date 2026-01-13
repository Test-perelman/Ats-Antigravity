"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTimesheetDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_timesheet_dto_1 = require("./create-timesheet.dto");
class UpdateTimesheetDto extends (0, mapped_types_1.PartialType)(create_timesheet_dto_1.CreateTimesheetDto) {
}
exports.UpdateTimesheetDto = UpdateTimesheetDto;
//# sourceMappingURL=update-timesheet.dto.js.map