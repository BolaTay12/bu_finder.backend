import { ApiProperty } from "@nestjs/swagger";
import { responseStatus } from "src/db/schema/enums";

export class GetProfileResponseDto {
    @ApiProperty({ example: responseStatus.SUCCESS, description: 'Response status' })
    status: responseStatus;

    @ApiProperty({ example: 'Profile retrieved', description: 'Response message' })
    message: string;

    @ApiProperty({ example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        fullName: 'John Doe',
        email: 'john.doe@babcock.edu.ng',
        universityId: '22/1234',
    },
        description: 'Data containing user profile information'
    })
    data: {
        id: string;
        fullName: string;
        email: string;
        universityId: string;
        role: string;
        createdAt: Date;
    }
}