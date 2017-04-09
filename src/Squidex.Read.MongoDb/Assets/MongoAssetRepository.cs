﻿// ==========================================================================
//  MongoAssetRepository.cs
//  Squidex Headless CMS
// ==========================================================================
//  Copyright (c) Squidex Group
//  All rights reserved.
// ==========================================================================

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using Squidex.Infrastructure.CQRS.Events;
using Squidex.Infrastructure.MongoDb;
using Squidex.Read.Assets;
using Squidex.Read.Assets.Repositories;

namespace Squidex.Read.MongoDb.Assets
{
    public partial class MongoAssetRepository : MongoRepositoryBase<MongoAssetEntity>, IAssetRepository, IEventConsumer
    {
        public MongoAssetRepository(IMongoDatabase database) 
            : base(database)
        {
        }

        public async Task<IReadOnlyList<IAssetEntity>> QueryAsync(Guid appId, HashSet<string> mimeTypes = null, string query = null, int take = 10, int skip = 0)
        {
            var filter = CreateFilter(appId, mimeTypes, query);

            var assets =
                await Collection.Find(filter).Skip(skip).Limit(take).ToListAsync();

            return assets.OfType<IAssetEntity>().ToList();
        }

        public async Task<long> CountAsync(Guid appId, HashSet<string> mimeTypes = null, string query = null)
        {
            var filter = CreateFilter(appId, mimeTypes, query);

            var count =
                await Collection.Find(filter).CountAsync();

            return count;
        }

        public async Task<IAssetEntity> FindAssetAsync(Guid id)
        {
            var entity =
                await Collection.Find(s => s.Id == id).FirstOrDefaultAsync();

            return entity;
        }

        private static FilterDefinition<MongoAssetEntity> CreateFilter(Guid appId, ICollection<string> mimeTypes, string query)
        {
            var filters = new List<FilterDefinition<MongoAssetEntity>>
            {
                Filter.Eq(x => x.AppId, appId)
            };

            if (mimeTypes != null && mimeTypes.Count > 0)
            {
                filters.Add(Filter.In(x => x.MimeType, mimeTypes));
            }

            if (!string.IsNullOrWhiteSpace(query))
            {
                filters.Add(Filter.Regex(x => x.FileName, new BsonRegularExpression(query, "i")));
            }

            var filter = Filter.And(filters);

            return filter;
        }
    }
}
