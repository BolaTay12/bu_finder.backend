export class GetProfileResponseDto {
    status: string;
    message: string;
    data: {
        id: string;
        fullName: string;
        email: string;
        universityId: string;
        role: string;
        createdAt: Date;
    }
}