import { Request, Response } from "express";

export default class RenderTemplateEngine {
  public async renderWithSession(
    req: Request,
    res: Response,
    view: string,
    data: any = {}
  ) {
    return res.render("main", {
      ...data,
      session: req.session || { user: null },
      content: await this.renderView(res, view, {
        ...data,
        session: req.session || { user: null },
      }),
    });
  }

  private async renderView(
    res: Response,
    view: string,
    data: any
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      res.render(view, data, (err: Error, html: string) => {
        if (err) reject(err);
        resolve(html);
      });
    });
  }
}
