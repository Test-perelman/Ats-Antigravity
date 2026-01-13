"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateImmigrationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_immigration_dto_1 = require("./create-immigration.dto");
class UpdateImmigrationDto extends (0, mapped_types_1.PartialType)(create_immigration_dto_1.CreateImmigrationDto) {
}
exports.UpdateImmigrationDto = UpdateImmigrationDto;
//# sourceMappingURL=update-immigration.dto.js.map