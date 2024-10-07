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
    backgroundImageURL?: string | null;
}

export interface Post {
    userId: string;
    body: string;
    createdAt: any;
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
    commentId: string;
    body: string;
    postId: string;
    createdAt: any;
    userId: string;
    photoURL: string | null;
    displayName: string | null;
    likeCount: number;
    dislikeCount: number;
    replyCount: number;
    likes?: Array<string>;
}
