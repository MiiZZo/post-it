import { SetMetadata } from "@nestjs/common";

export const ShouldSkipAuth = () => SetMetadata("should-skip-auth", true);
