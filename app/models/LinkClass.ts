export class LinkClass {
    private key!: number
    private name!: string
    private num!: number
    private link!: string;
    private linkTitle!: string

    constructor();

    constructor(
        key?: number,
        name?: string,
        num?: number,
        link?: string,
        linkTitle?: string
    )

    constructor(key?: number,
        name?: string,
        num?: number,
        link?: string,
        linkTitle?: string) {
        this.key = key ?? 0,
            this.name = name ?? "",
            this.num = num ?? 0
        this.link = link ?? ""
        this.linkTitle = linkTitle ?? ""

    }



    //getters 

    public getKey(): number {
        return this.key;
    }

    public getName(): string {
        return this.name;
    }

    public getNum(): number {
        return this.num;
    }

    public getLink(): string {
        return this.link;
    }

    public getTitle(): string {
        return this.linkTitle;
    }


    // setters
    public setKey(key: number): void {
        this.key = key
    }

    public setName(name: string): void {
        this.name = name
    }

    public setNum(num: number): void {
        this.num = num
    }

    public setLink(link: string): void {
        this.link = link
    }

    public setLinkTitle(linkTitle: string): void {
        this.linkTitle = linkTitle
    }

    // function for parsing an json/obj in 

    public parse(data: any): LinkClass {
        return new LinkClass(
            data.key,
            data.name,
            data.num,
            data.link,
            data.linkTitle
        );
    }

}