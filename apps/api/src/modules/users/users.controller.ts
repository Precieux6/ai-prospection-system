import { Controller, Get, Put, Post, Body, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { extractTextFromPDF } from "../utils/pdf-extractor";

@Controller("api/users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private async getOrCreateUser() {
    let user = await this.usersService.findByClerkId("test-clerk-id");
    
    if (!user) {
      user = await this.usersService.create({
        clerkId: "test-clerk-id",
        email: "test@example.com",
        fullName: "Utilisateur Test",
        baseProfileText: "",
      });
    }
    
    if (!user) {
      throw new Error("Impossible de créer ou récupérer l'utilisateur");
    }
    
    return user;
  }

  @Get("me")
  async getMe() {
    return this.getOrCreateUser();
  }

  @Get("me/settings")
  async getSettings() {
    const user = await this.getOrCreateUser();
    return this.usersService.getSettings(user.id);
  }

  @Put("me/settings")
  async updateSettings(@Body() body: any) {
    const user = await this.getOrCreateUser();
    return this.usersService.updateSettings(user.id, body);
  }

  @Post("me/cv")
  @UseInterceptors(FileInterceptor("cv"))
  async uploadCV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error("Aucun fichier reçu");
    }

    const profileText = await extractTextFromPDF(file.buffer);
    const user = await this.getOrCreateUser();
    await this.usersService.updateProfile(user.id, profileText);

    return { profileText, fileName: file.originalname };
  }

  @Put("me/profile")
  async updateProfile(@Body() body: { baseProfileText: string }) {
    const user = await this.getOrCreateUser();
    await this.usersService.updateProfile(user.id, body.baseProfileText);
    return { success: true, userId: user.id };
  }
}