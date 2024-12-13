import {Component} from '@angular/core';
import {Link} from "../../domains/Link";
import {ActivatedRoute, Router} from "@angular/router";
import {NavigationService} from "../../services/navigation.service";
import {AetherOnePiService} from "../../services/aether-one-pi.service";
import {Case} from "../../domains/Case";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  serverOnline:boolean = false;
  links: Link[] = [];
  case:Case = new Case()

  constructor(private router: Router,
              private route: ActivatedRoute,
              private navigationService:NavigationService,
              private aetherOnePiService:AetherOnePiService,
              private titleService:Title) {

    this.ping();
    this.aetherOnePiService.loadSettings().subscribe( settings => {
      console.log(settings)
      this.aetherOnePiService.settings = settings;
    });

    this.aetherOnePiService.getCase().subscribe( c =>  {
      this.case = c
      this.titleService.setTitle(`AetherOnePi - ${c.name}`)
    })

    this.initLinks();
    let currentUrl = window.location.href;
    currentUrl = currentUrl.substring(currentUrl.lastIndexOf("/") + 1);
    this.activateCurrentLink(currentUrl);

    this.navigationService.navigate.subscribe( (url:string) => {
      this.navigate(url);
    });
  }

  private initLinks() {
    this.addLink("HOME", true, "#f88b00");
    this.addLink("CASES", false, "#10a4d1");
    this.addLink("ANALYSIS", false, "#c410d1");
    this.addLink("MAP", false, "#21a103");
    this.addLink("WEAVER", false, "#10d1b1");
    this.addLink("BROADCAST", false, "#43d110");
    this.addLink("SETTINGS", false, "#6c6c6c");
  }

  addLink(name: string, active: boolean, color: string) {
    let link = new Link();
    link.name = name;
    link.active = active;
    link.color = color;
    this.links.push(link)
  }

  navigate(navigationPath: string) {
    this.activateCurrentLink(navigationPath);
    this.router.navigate([navigationPath], {relativeTo: this.route});
  }

  private activateCurrentLink(navigationPath?: string) {

    if (navigationPath?.length === 0) {
      navigationPath = 'DASHBOARD';
    }

    this.links.forEach(link => {
      link.active = false;

      if (link.name === navigationPath) {
        link.active = true;
      }
    });
  }

  private ping() {
    this.aetherOnePiService.ping().subscribe( pingResult => {
      this.serverOnline = true;
    }, error => this.serverOnline = false);
    setTimeout(() => {
      this.ping();
    }, 5000);
  }
}
