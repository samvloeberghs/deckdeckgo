import {Component, Event, EventEmitter, Prop, State} from '@stencil/core';

import {Subscription} from 'rxjs';

import {User} from '../../../models/user';

import {Utils} from '../../../utils/utils';

import {AuthService} from '../../../services/auth/auth.service';
import {NavDirection, NavService} from '../../../services/nav/nav.service';

@Component({
    tag: 'app-navigation-actions',
    styleUrl: 'app-navigation-actions.scss',
    shadow: false
})
export class AppNavigationActions {

    @Prop({connect: 'ion-popover-controller'}) popoverController: HTMLIonPopoverControllerElement;

    @Prop() signIn: boolean = true;
    @Prop() presentation: boolean = false;
    @Prop() publish: boolean = false;

    private authService: AuthService;
    private subscription: Subscription;

    private navService: NavService;

    @State()
    private user: User;

    @Event() private actionPublish: EventEmitter<void>;

    constructor() {
        this.authService = AuthService.getInstance();
        this.navService = NavService.getInstance();
    }

    componentWillLoad() {
        this.subscription = this.authService.watch().subscribe((user: User) => {
            this.user = user;
        });
    }

    componentDidUnload() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private async openMenu($event: UIEvent) {
        const popover: HTMLIonPopoverElement = await this.popoverController.create({
            component: 'app-user-menu',
            event: $event,
            mode: 'ios'
        });

        await popover.present();
    }

    private async navigateSignIn() {
        this.navService.navigate({
            url: '/signin',
            direction: NavDirection.FORWARD
        });
    }

    render() {
        return <div>
            {this.renderSignIn()}
            {this.renderPresentationButton()}
            {this.renderPublishButton()}
            {this.renderLoggedIn()}
        </div>;
    }

    private renderSignIn() {
        if (Utils.isLoggedIn(this.user) || !this.signIn) {
            return undefined;
        } else if (this.presentation || this.publish) {
            return <a padding-start padding-end class="signin" onClick={() => this.navigateSignIn()}>
                <ion-label>Sign in</ion-label>
            </a>;
        }
    }

    private renderLoggedIn() {
        if (Utils.isLoggedIn(this.user)) {
            return <a padding-end onClick={(e: UIEvent) => this.openMenu(e)}>
                <app-avatar src={this.user.photo_url}></app-avatar>
            </a>;
        } else {
            return undefined;
        }
    }

    private renderPresentationButton() {
        if (this.presentation) {
            return <ion-button class="presentation" shape="round" href="/editor" routerDirection="forward" padding-end>
                <ion-label class="ion-text-uppercase">Write a presentation</ion-label>
            </ion-button>;
        } else {
            return null;
        }
    }

    private renderPublishButton() {
        if (this.publish) {
            return <ion-button class="publish" shape="round" onClick={() => this.actionPublish.emit()} padding-end>
                <ion-label class="ion-text-uppercase">Ready to publish?</ion-label>
            </ion-button>;
        } else {
            return null;
        }
    }

}
