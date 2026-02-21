export interface Wallpaper {
	id: string;
	prompt: string;
	imageUrl: string;
	createdAt: string;
}

export interface GenerateRequest {
	prompt: string;
	width: number;
	height: number;
}

export interface GenerateResponse {
	imageUrl: string;
	metadata: {
		prompt: string;
		modelUsed: string;
		generationTime: number;
	};
}
