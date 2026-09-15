import { Request } from 'express';
import type { ICampaignRule, ICampaignRuleCondition } from '../models/Campaign.js';
import type { ILink } from '../models/Link.js';
import Link from '../models/Link.js';
import { lookupGeo } from '../utils/geoLookup.js';
import { campaignService } from './campaign.service.js';
import { syncExpiryState } from './links.service.js';

type DeviceType = 'desktop' | 'mobile' | 'tablet';

interface RoutingContext {
  device: DeviceType;
  country: string;
  languages: string[];
}

const deviceFromRequest = (req: Request): DeviceType => {
  const userAgent = req.headers['user-agent']?.toString() ?? '';
  if (/ipad|android(?!.*mobile)/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile|windows.*phone/i.test(userAgent)) return 'mobile';
  return 'desktop';
};

const languagesFromRequest = (req: Request): string[] => {
  const header = req.headers['accept-language']?.toString() ?? '';
  return header
    .split(',')
    .map((part) => part.trim().split(';')[0]?.toLowerCase())
    .filter((language): language is string => Boolean(language));
};

const currentMinuteInTimezone = (timezone: string): number | null => {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const hour = Number(parts.find((part) => part.type === 'hour')?.value);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value);
    return Number.isInteger(hour) && Number.isInteger(minute) ? hour * 60 + minute : null;
  } catch {
    return null;
  }
};

const matchesTimeRange = (minute: number, startMinute: number, endMinute: number): boolean =>
  startMinute < endMinute
    ? minute >= startMinute && minute < endMinute
    : minute >= startMinute || minute < endMinute;

export const conditionMatches = (condition: ICampaignRuleCondition, context: RoutingContext): boolean => {
  if (condition.type === 'device') {
    return condition.values?.includes(context.device) ?? false;
  }
  if (condition.type === 'country') {
    return condition.values?.includes(context.country) ?? false;
  }
  if (condition.type === 'language') {
    return (condition.values ?? []).some((targetLanguage) => {
      const normalizedTarget = targetLanguage.toLowerCase();
      return context.languages.some(
        (language) => language === normalizedTarget || language.startsWith(`${normalizedTarget}-`),
      );
    });
  }
  if (
    condition.startMinute === undefined ||
    condition.endMinute === undefined ||
    !condition.timezone
  ) {
    return false;
  }
  const minute = currentMinuteInTimezone(condition.timezone);
  return minute !== null && matchesTimeRange(minute, condition.startMinute, condition.endMinute);
};

export class CampaignRoutingService {
  async resolveDestination(entryLink: ILink, req: Request): Promise<ILink | null> {
    const routingCampaign = await campaignService.getActiveRoutingCampaign(entryLink._id);
    if (!routingCampaign) return null;

    const { campaign, rules } = routingCampaign;
    const context = await this.buildContext(req, rules);
    const selectedRule = rules.find((rule) => conditionMatches(rule.condition, context));
    const selectedLinkId = selectedRule?.targetLinkId ?? campaign.defaultLinkId;

    const destination = await this.getActiveDestination(selectedLinkId.toString());
    if (destination) return destination;

    if (selectedRule) {
      return this.getActiveDestination(campaign.defaultLinkId.toString());
    }
    return null;
  }

  private async buildContext(req: Request, rules: ICampaignRule[]): Promise<RoutingContext> {
    const needsCountry = rules.some((rule) => rule.condition.type === 'country');
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const geo = needsCountry ? await lookupGeo(ipAddress) : { country: 'unknown' };
    return {
      device: deviceFromRequest(req),
      country: geo.country.toUpperCase(),
      languages: languagesFromRequest(req),
    };
  }

  private async getActiveDestination(linkId: string): Promise<ILink | null> {
    const link = await Link.findOne({ _id: linkId, isActive: true, isArchived: { $ne: true } });
    if (!link || syncExpiryState(link)) return null;
    return link;
  }
}

export const campaignRoutingService = new CampaignRoutingService();
