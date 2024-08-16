export interface SidebarItems {
    label: string;
    route?: string;
    icon?: string;
    isActive?: boolean;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    emailVerified: boolean;
    username?: string;
    createdAt: any;
    bio?: string;
}

export interface Post {
    userId: string;
    body: string;
    createdAt: any;
    user?: User;
    photoURL: string | null;
    displayName: string | null;
    postId: string;
    likeCount: number;
    dislikeCount: number;
    bookmarkCount: number;
    repostCount: number;
    commentCount: number;
    likes?: Array<string>;
    views: number;
}

export interface Comment {
    id?: string;
    body: string;
    postId: string;
    createdAt?: any;
    userId: string;
    user?: User;
}
