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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createInvoiceDto) {
        return this.prisma.client.invoice.create({
            data: {
                ...createInvoiceDto,
                invoiceDate: new Date(createInvoiceDto.invoiceDate),
                dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : undefined,
            },
        });
    }
    async findAll() {
        return this.prisma.client.invoice.findMany({
            orderBy: { invoiceDate: 'desc' },
            include: {
                client: true
            }
        });
    }
    async findOne(id) {
        return this.prisma.client.invoice.findUnique({
            where: { id },
            include: {
                client: true
            }
        });
    }
    async update(id, updateInvoiceDto) {
        const data = { ...updateInvoiceDto };
        if (data.invoiceDate)
            data.invoiceDate = new Date(data.invoiceDate);
        if (data.dueDate)
            data.dueDate = new Date(data.dueDate);
        return this.prisma.client.invoice.update({
            where: { id },
            data: data,
        });
    }
    async remove(id) {
        return this.prisma.client.invoice.delete({
            where: { id },
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map