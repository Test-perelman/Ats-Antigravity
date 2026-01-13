"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmigrationController = void 0;
const common_1 = require("@nestjs/common");
const immigration_service_1 = require("./immigration.service");
const create_immigration_dto_1 = require("./dto/create-immigration.dto");
const update_immigration_dto_1 = require("./dto/update-immigration.dto");
const passport_1 = require("@nestjs/passport");
const team_guard_1 = require("../common/guards/team.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let ImmigrationController = class ImmigrationController {
    immigrationService;
    constructor(immigrationService) {
        this.immigrationService = immigrationService;
    }
    create(createImmigrationDto) {
        return this.immigrationService.create(createImmigrationDto);
    }
    findAll() {
        return this.immigrationService.findAll();
    }
    findOne(id) {
        return this.immigrationService.findOne(id);
    }
    update(id, updateImmigrationDto) {
        return this.immigrationService.update(id, updateImmigrationDto);
    }
    remove(id) {
        return this.immigrationService.remove(id);
    }
};
exports.ImmigrationController = ImmigrationController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin', 'team_admin', 'manager'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_immigration_dto_1.CreateImmigrationDto]),
    __metadata("design:returntype", void 0)
], ImmigrationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('viewer', 'recruiter', 'team_admin', 'manager'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ImmigrationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('viewer', 'recruiter', 'team_admin', 'manager'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ImmigrationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('team_admin', 'manager'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_immigration_dto_1.UpdateImmigrationDto]),
    __metadata("design:returntype", void 0)
], ImmigrationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('team_admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ImmigrationController.prototype, "remove", null);
exports.ImmigrationController = ImmigrationController = __decorate([
    (0, common_1.Controller)('immigration'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), team_guard_1.TeamGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [immigration_service_1.ImmigrationService])
], ImmigrationController);
//# sourceMappingURL=immigration.controller.js.map