import { createLazySingleton } from "../utils";
import { MongoUserRepository } from "@/modules/Identity/infrastructure/persistence/mongoose/MongoUserRepository";
import { MongoSessionRepository } from "@/modules/Identity/infrastructure/persistence/mongoose/MongoSessionRepository";
import { Argon2PasswordHasher } from "@/modules/Identity/infrastructure/services/Argon2PasswordHasher";
import { LoginUser } from "@/modules/Identity/application/login/LoginUser";
import { RegisterUser } from "@/modules/Identity/application/register/RegisterUser";
import { LogoutUser } from "@/modules/Identity/application/logout/LogoutUser";
import { UpdateUserProfile } from "@/modules/Identity/application/update-profile/UpdateUserProfile";
import { ChangePassword } from "@/modules/Identity/application/change-password/ChangePassword";
import { IdentitySessionQueryService } from "@/modules/Identity/infrastructure/queries/IdentitySessionQueryService";
import { IdentityUserContactQueryService } from "@/modules/Identity/infrastructure/queries/IdentityUserContactQueryService";

export function createIdentityModule() {
  const getUserRepository = createLazySingleton(() => new MongoUserRepository());
  const getSessionRepository = createLazySingleton(() => new MongoSessionRepository());
  const getPasswordHasher = createLazySingleton(() => new Argon2PasswordHasher());
  const getUserContactQueryService = createLazySingleton(() => new IdentityUserContactQueryService(getUserRepository()));
  
  const useCases = {
    loginUser: createLazySingleton(() => new LoginUser(getUserRepository(), getPasswordHasher(), getSessionRepository())),
    registerUser: createLazySingleton(() => new RegisterUser(getUserRepository(), getPasswordHasher())),
    logoutUser: createLazySingleton(() => new LogoutUser(getSessionRepository())),
    updateUserProfile: createLazySingleton(() => new UpdateUserProfile(getUserRepository())),
    changePassword: createLazySingleton(() => new ChangePassword(getUserRepository(), getPasswordHasher())),
  };
  
  const repositories = {
    session: getSessionRepository,
    user: getUserRepository,
  };

  const queries = {
    sessionQueryService: createLazySingleton(() => new IdentitySessionQueryService(getSessionRepository())),
    userContactQueryService: getUserContactQueryService,
  };
  
  return {
    useCases,
    repositories,
    queries,
  };
}

