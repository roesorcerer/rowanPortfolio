import { Component, OnInit } from '@angular/core';
import { MegaMenuItem } from 'primeng/api';
import { MegaMenuModule } from 'primeng/megamenu';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { last } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MegaMenuModule, ButtonModule, CommonModule, AvatarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
items: MegaMenuItem[] | undefined;

ngOnInit() {
  this.items = [
    {
      label: 'Sprout Garden',
      root: true,
      items: [
                    [
                        {
                            items: [
                                { label: 'Home', icon: 'pi pi-home', subtext: 'Take me home' },
                                { label: 'About Me', icon: 'pi pi-question-circle', subtext: 'Find out about me' },
                                { label: 'Projects', icon: 'pi pi-book', subtext: 'See current projects' }
                            ]
                        }
                    ],
                    [
                        {
                            items: [
                                { label: 'Resume', icon: 'pi pi-briefcase', subtext: 'Subtext of item' },
                                { label: 'Code Level', icon: 'pi pi-chart-line', subtext: 'Subtext of item' },
                                { label: 'Library', icon: 'pi pi-search', subtext: 'Subtext of item' }
                            ]
                        }
                    ],
                    [
                        {
                            items: [
                                { label: 'Community', icon: 'pi pi-comments', subtext: 'Subtext of item' },
                                { label: 'Rewards', icon: 'pi pi-star', subtext: 'Subtext of item' },
                                { label: 'Investors', icon: 'pi pi-globe', subtext: 'Subtext of item' }
                            ]
                        }
                    ],
                    [
                        {
                            items: [{ image: 'https://primefaces.org/cdn/primeng/images/uikit/uikit-system.png', label: 'GET STARTED', subtext: 'Build spectacular apps in no time.' }]
                        }
                    ]
                ]
            },
            {
                label: 'Resources',
                root: true
            },
            {
                label: 'Contact',
                root: true
            }
        ];
    }
}
