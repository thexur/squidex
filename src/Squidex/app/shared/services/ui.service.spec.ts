/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import {
    ApiUrlConfig,
    UIService,
    UISettingsDto
} from './../';

describe('UIService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                UIService,
                { provide: ApiUrlConfig, useValue: new ApiUrlConfig('http://service/p/') }
            ]
        });
    });

    afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
        httpMock.verify();
    }));

    it('should make get request to get common settings',
        inject([UIService, HttpTestingController], (uiService: UIService, httpMock: HttpTestingController) => {

        let settings: UISettingsDto;

        uiService.getCommonSettings().subscribe(result => {
            settings = result;
        });

        const response: UISettingsDto = { mapType: 'OSM', mapKey: '', canCreateApps: true };

        const req = httpMock.expectOne('http://service/p/api/ui/settings');

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('If-Match')).toBeNull();

        req.flush(response);

        expect(settings!).toEqual(response);
    }));

    it('should return default common settings when error occurs',
        inject([UIService, HttpTestingController], (uiService: UIService, httpMock: HttpTestingController) => {

        let settings: object;

        uiService.getCommonSettings().subscribe(result => {
            settings = result;
        });

        const req = httpMock.expectOne('http://service/p/api/ui/settings');

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('If-Match')).toBeNull();

        req.error(new ErrorEvent('500'));

        expect(settings!).toEqual({ mapType: 'OSM', mapKey: '', canCreateApps: true });
    }));

    it('should make get request to get settings',
        inject([UIService, HttpTestingController], (uiService: UIService, httpMock: HttpTestingController) => {

        let settings: object;

        uiService.getSettings('my-app').subscribe(result => {
            settings = result;
        });

        const response = { mapType: 'OSM', mapKey: '' };

        const req = httpMock.expectOne('http://service/p/api/apps/my-app/ui/settings');

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('If-Match')).toBeNull();

        req.flush(response);

        expect(settings!).toEqual(response);
    }));

    it('should return default settings when error occurs',
        inject([UIService, HttpTestingController], (uiService: UIService, httpMock: HttpTestingController) => {

        let settings: object;

        uiService.getSettings('my-app').subscribe(result => {
            settings = result;
        });

        const req = httpMock.expectOne('http://service/p/api/apps/my-app/ui/settings');

        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.get('If-Match')).toBeNull();

        req.error(new ErrorEvent('500'));

        expect(settings!).toBeDefined();
    }));

    it('should make put request to set value',
        inject([UIService, HttpTestingController], (uiService: UIService, httpMock: HttpTestingController) => {

        uiService.putSetting('my-app', 'root.nested', 123).subscribe();

        const req = httpMock.expectOne('http://service/p/api/apps/my-app/ui/settings/root.nested');

        expect(req.request.method).toEqual('PUT');
        expect(req.request.headers.get('If-Match')).toBeNull();
    }));

    it('should make delete request to remove value',
        inject([UIService, HttpTestingController], (uiService: UIService, httpMock: HttpTestingController) => {

        uiService.deleteSetting('my-app', 'root.nested').subscribe();

        const req = httpMock.expectOne('http://service/p/api/apps/my-app/ui/settings/root.nested');

        expect(req.request.method).toEqual('DELETE');
        expect(req.request.headers.get('If-Match')).toBeNull();
    }));
});