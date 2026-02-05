
export interface Attachment {
    type: 'image' | 'application/pdf' | 'text/plain';
    content: string; // Base64 for binary, string for text
    name: string;
    size: number;
}
