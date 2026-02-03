import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PistonService } from "./piston.service";
import { Judge0Service } from "./judge0.service";

// Factory to provide the correct code execution service based on config
const CodeExecutionServiceProvider = {
  provide: "CODE_EXECUTION_SERVICE",
  useFactory: (
    config: ConfigService,
    piston: PistonService,
    judge0: Judge0Service,
  ) => {
    const engine = config.get("CODE_EXECUTION_ENGINE") || "judge0";
    return engine === "piston" ? piston : judge0;
  },
  inject: [ConfigService, PistonService, Judge0Service],
};

@Module({
  imports: [ConfigModule],
  providers: [PistonService, Judge0Service, CodeExecutionServiceProvider],
  exports: [PistonService, Judge0Service, "CODE_EXECUTION_SERVICE"],
})
export class PistonModule {}
