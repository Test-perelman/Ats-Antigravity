export declare class CreateInvoiceDto {
    clientId: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
    totalAmount: number;
    status?: string;
}
